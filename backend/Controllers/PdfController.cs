using Microsoft.AspNetCore.Mvc;
using PDFora.Backend.Services;
using PDFora.Backend.Helpers;

namespace PDFora.Backend.Controllers;

[ApiController]
[Route("api/pdf")]
public class PdfController : ControllerBase
{
    private readonly ILibreOfficeService _libreOffice;
    private readonly IImageConversionService _imageConversion;
    private readonly IPdfManipulationService _pdfManipulation;
    private readonly ILogger<PdfController> _logger;

    public PdfController(
        ILibreOfficeService libreOffice,
        IImageConversionService imageConversion,
        IPdfManipulationService pdfManipulation,
        ILogger<PdfController> logger)
    {
        _libreOffice = libreOffice;
        _imageConversion = imageConversion;
        _pdfManipulation = pdfManipulation;
        _logger = logger;
    }

    [HttpPost("word-to-pdf")]
    [RequestSizeLimit(50 * 1024 * 1024)]
    public async Task<IActionResult> WordToPdf([FromForm] IFormFile file) => await HandleLibreOfficeConversion(file, ".pdf", "application/pdf");

    [HttpPost("excel-to-pdf")]
    [RequestSizeLimit(50 * 1024 * 1024)]
    public async Task<IActionResult> ExcelToPdf([FromForm] IFormFile file) => await HandleLibreOfficeConversion(file, ".pdf", "application/pdf");

    [HttpPost("powerpoint-to-pdf")]
    [RequestSizeLimit(50 * 1024 * 1024)]
    public async Task<IActionResult> PowerPointToPdf([FromForm] IFormFile file) => await HandleLibreOfficeConversion(file, ".pdf", "application/pdf");

    private async Task<IActionResult> HandleLibreOfficeConversion(IFormFile file, string ext, string mimeType)
    {
        if (file == null || file.Length == 0) return BadRequest(new { error = "No file provided" });
        
        var workDir = FileHelper.CreateTempDirectory();
        try
        {
            var inputPath = await FileHelper.SaveUploadedFileAsync(file, workDir);
            var outputPath = await _libreOffice.ConvertToPdfAsync(inputPath, workDir);
            
            var bytes = await System.IO.File.ReadAllBytesAsync(outputPath);
            var originalName = string.IsNullOrEmpty(file.FileName) ? "document" : Path.GetFileNameWithoutExtension(file.FileName);
            return File(bytes, mimeType, originalName + ext);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Conversion failed for file {FileName}", file.FileName);
            return BadRequest(new { error = "Conversion failed. Please make sure the document is a valid, uncorrupted Word, Excel, or PowerPoint file and is not password protected." });
        }
        finally
        {
            FileHelper.CleanupDirectory(workDir);
        }
    }

    [HttpPost("jpg-to-pdf")]
    [RequestSizeLimit(50 * 1024 * 1024)]
    public async Task<IActionResult> JpgToPdf([FromForm] List<IFormFile> files)
    {
        if (files == null || files.Count == 0) return BadRequest(new { error = "No files provided" });

        var workDir = FileHelper.CreateTempDirectory();
        try
        {
            var paths = new List<string>();
            foreach (var file in files)
            {
                paths.Add(await FileHelper.SaveUploadedFileAsync(file, workDir));
            }

            var outputPath = Path.Combine(workDir, "images.pdf");
            await _imageConversion.ConvertImagesToPdfAsync(paths, outputPath);
            
            var bytes = await System.IO.File.ReadAllBytesAsync(outputPath);
            return File(bytes, "application/pdf", "images.pdf");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Image to PDF failed");
            return StatusCode(500, new { error = "Conversion failed" });
        }
        finally
        {
            FileHelper.CleanupDirectory(workDir);
        }
    }

    [HttpPost("pdf-to-jpg")]
    [RequestSizeLimit(50 * 1024 * 1024)]
    public async Task<IActionResult> PdfToJpg([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest(new { error = "No file provided" });
        
        var workDir = FileHelper.CreateTempDirectory();
        try
        {
            var inputPath = await FileHelper.SaveUploadedFileAsync(file, workDir);
            var outputDir = Path.Combine(workDir, "output");
            Directory.CreateDirectory(outputDir);
            
            var images = await _imageConversion.ConvertPdfToImagesAsync(inputPath, outputDir);
            
            if (images.Count == 1)
            {
                var bytes = await System.IO.File.ReadAllBytesAsync(images[0]);
                return File(bytes, "image/jpeg", "page_1.jpg");
            }
            else
            {
                var zipPath = Path.Combine(workDir, "pages.zip");
                FileHelper.CreateZipFromDirectory(outputDir, zipPath);
                var bytes = await System.IO.File.ReadAllBytesAsync(zipPath);
                return File(bytes, "application/zip", "pages.zip");
            }
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "PDF to JPG conversion rejected: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "PDF to JPG failed");
            return StatusCode(500, new { error = "Conversion failed" });
        }
        finally
        {
            FileHelper.CleanupDirectory(workDir);
        }
    }

    [HttpPost("merge")]
    [RequestSizeLimit(100 * 1024 * 1024)]
    public async Task<IActionResult> Merge([FromForm] List<IFormFile> files)
    {
        if (files == null || files.Count < 2) return BadRequest(new { error = "At least 2 files required" });

        var workDir = FileHelper.CreateTempDirectory();
        try
        {
            var paths = new List<string>();
            foreach (var file in files)
            {
                paths.Add(await FileHelper.SaveUploadedFileAsync(file, workDir));
            }

            var outputPath = Path.Combine(workDir, "merged.pdf");
            await _pdfManipulation.MergePdfsAsync(paths, outputPath);
            
            var bytes = await System.IO.File.ReadAllBytesAsync(outputPath);
            return File(bytes, "application/pdf", "merged.pdf");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Merge failed");
            return StatusCode(500, new { error = "Merge failed" });
        }
        finally
        {
            FileHelper.CleanupDirectory(workDir);
        }
    }

    [HttpPost("compress")]
    [RequestSizeLimit(50 * 1024 * 1024)]
    public async Task<IActionResult> Compress([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest(new { error = "No file provided" });
        
        var workDir = FileHelper.CreateTempDirectory();
        try
        {
            var inputPath = await FileHelper.SaveUploadedFileAsync(file, workDir);
            var outputPath = Path.Combine(workDir, "compressed.pdf");
            
            await _pdfManipulation.CompressPdfAsync(inputPath, outputPath);
            
            var bytes = await System.IO.File.ReadAllBytesAsync(outputPath);
            return File(bytes, "application/pdf", "compressed.pdf");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Compress failed");
            return StatusCode(500, new { error = "Compression failed" });
        }
        finally
        {
            FileHelper.CleanupDirectory(workDir);
        }
    }

    [HttpPost("split")]
    [RequestSizeLimit(50 * 1024 * 1024)]
    public async Task<IActionResult> Split([FromForm] IFormFile file, [FromForm] string? ranges = "all")
    {
        if (file == null || file.Length == 0) return BadRequest(new { error = "No file provided" });
        
        var workDir = FileHelper.CreateTempDirectory();
        try
        {
            var inputPath = await FileHelper.SaveUploadedFileAsync(file, workDir);
            var outputDir = Path.Combine(workDir, "output");
            Directory.CreateDirectory(outputDir);
            
            await _pdfManipulation.SplitPdfAsync(inputPath, outputDir, ranges ?? "all");
            
            var resultFiles = Directory.GetFiles(outputDir);
            if (resultFiles.Length == 1)
            {
                var bytes = await System.IO.File.ReadAllBytesAsync(resultFiles[0]);
                return File(bytes, "application/pdf", Path.GetFileName(resultFiles[0]));
            }
            else
            {
                var zipPath = Path.Combine(workDir, "split_pages.zip");
                FileHelper.CreateZipFromDirectory(outputDir, zipPath);
                var bytes = await System.IO.File.ReadAllBytesAsync(zipPath);
                return File(bytes, "application/zip", "split_pages.zip");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Split failed");
            return StatusCode(500, new { error = "Split failed" });
        }
        finally
        {
            FileHelper.CleanupDirectory(workDir);
        }
    }
}
