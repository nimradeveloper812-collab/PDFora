using ImageMagick;
using Docnet.Core;
using Docnet.Core.Models;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;

namespace PDFora.Backend.Services;

public interface IImageConversionService
{
    Task<string> ConvertImagesToPdfAsync(List<string> imagePaths, string outputFilePath);
    Task<List<string>> ConvertPdfToImagesAsync(string pdfPath, string outputDir);
}

public class ImageConversionService : IImageConversionService
{
    public async Task<string> ConvertImagesToPdfAsync(List<string> imagePaths, string outputFilePath)
    {
        using var collection = new MagickImageCollection();
        foreach (var path in imagePaths)
        {
            var image = new MagickImage(path);
            image.Format = MagickFormat.Pdf;
            collection.Add(image);
        }
        
        await Task.Run(() => collection.Write(outputFilePath, MagickFormat.Pdf));
        return outputFilePath;
    }

    public async Task<List<string>> ConvertPdfToImagesAsync(string pdfPath, string outputDir)
    {
        return await Task.Run(() =>
        {
            var imagePaths = new List<string>();
            var bytes = File.ReadAllBytes(pdfPath);

            using var docReader = DocLib.Instance.GetDocReader(bytes, new PageDimensions(1.5d)); // 1.5x scale for high resolution
            int pageCount = docReader.GetPageCount();

            for (int i = 0; i < pageCount; i++)
            {
                using var pageReader = docReader.GetPageReader(i);
                var rawBytes = pageReader.GetImage();
                int width = pageReader.GetPageWidth();
                int height = pageReader.GetPageHeight();

                using var image = Image.LoadPixelData<Bgra32>(rawBytes, width, height);
                var outPath = Path.Combine(outputDir, $"page_{i + 1}.jpg");
                image.SaveAsJpeg(outPath);
                imagePaths.Add(outPath);
            }

            return imagePaths;
        });
    }
}
