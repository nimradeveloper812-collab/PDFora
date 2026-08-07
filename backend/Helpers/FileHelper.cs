using System.IO.Compression;

namespace PDFora.Backend.Helpers;

public static class FileHelper
{
    public static string CreateTempDirectory()
    {
        var tempFolder = Path.Combine(Path.GetTempPath(), "PDFora", Guid.NewGuid().ToString());
        Directory.CreateDirectory(tempFolder);
        return tempFolder;
    }

    public static async Task<string> SaveUploadedFileAsync(IFormFile file, string destFolder)
    {
        if (file.Length == 0) throw new ArgumentException("Empty file.");
        
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".jpg", ".jpeg", ".png", ".webp", ".bmp" };
        
        if (!allowedExtensions.Contains(ext))
        {
            throw new ArgumentException("Invalid file extension.");
        }
        
        var destPath = Path.Combine(destFolder, Guid.NewGuid().ToString() + ext);
        
        using var stream = new FileStream(destPath, FileMode.Create);
        await file.CopyToAsync(stream);
        
        return destPath;
    }

    public static string CreateZipFromDirectory(string sourceDir, string zipPath)
    {
        ZipFile.CreateFromDirectory(sourceDir, zipPath, CompressionLevel.Fastest, false);
        return zipPath;
    }

    public static void CleanupDirectory(string dirPath)
    {
        try
        {
            if (Directory.Exists(dirPath))
            {
                Directory.Delete(dirPath, true);
            }
        }
        catch
        {
            // Best effort cleanup
        }
    }
}
