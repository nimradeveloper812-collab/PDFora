using System.Diagnostics;

namespace PDFora.Backend.Services;

public interface ILibreOfficeService
{
    Task<string> ConvertToPdfAsync(string inputFilePath, string outputDir);
}

public class LibreOfficeService : ILibreOfficeService
{
    private readonly ILogger<LibreOfficeService> _logger;

    public LibreOfficeService(ILogger<LibreOfficeService> logger)
    {
        _logger = logger;
    }

    public async Task<string> ConvertToPdfAsync(string inputFilePath, string outputDir)
    {
        var libreOfficePath = GetLibreOfficePath();
        
        var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = libreOfficePath,
                Arguments = $"--headless --convert-to pdf --outdir \"{outputDir}\" \"{inputFilePath}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            }
        };

        process.Start();
        var output = await process.StandardOutput.ReadToEndAsync();
        var error = await process.StandardError.ReadToEndAsync();
        await process.WaitForExitAsync();

        if (process.ExitCode != 0)
        {
            _logger.LogError("LibreOffice error: {Error}", error);
            throw new Exception("Document conversion failed.");
        }

        var outputFileName = Path.GetFileNameWithoutExtension(inputFilePath) + ".pdf";
        var expectedPath = Path.Combine(outputDir, outputFileName);
        
        if (!File.Exists(expectedPath))
        {
            throw new Exception("Conversion succeeded but output file is missing.");
        }
        
        return expectedPath;
    }

    private string GetLibreOfficePath()
    {
        if (OperatingSystem.IsWindows())
        {
            var path = @"C:\Program Files\LibreOffice\program\soffice.exe";
            if (!File.Exists(path))
            {
                _logger.LogWarning("LibreOffice not found at default Windows path. Make sure it's in PATH.");
                return "soffice";
            }
            return path;
        }
        return "libreoffice";
    }
}
