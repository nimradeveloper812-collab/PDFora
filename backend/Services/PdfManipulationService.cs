using PdfSharpCore.Pdf;
using PdfSharpCore.Pdf.IO;

namespace PDFora.Backend.Services;

public interface IPdfManipulationService
{
    Task<string> MergePdfsAsync(List<string> pdfPaths, string outputFilePath);
    Task<string> CompressPdfAsync(string pdfPath, string outputFilePath);
    Task<string> SplitPdfAsync(string pdfPath, string outputDir, string pageRanges);
}

public class PdfManipulationService : IPdfManipulationService
{
    public async Task<string> MergePdfsAsync(List<string> pdfPaths, string outputFilePath)
    {
        return await Task.Run(() =>
        {
            using var outputDocument = new PdfDocument();
            
            foreach (var path in pdfPaths)
            {
                using var inputDocument = PdfReader.Open(path, PdfDocumentOpenMode.Import);
                for (int i = 0; i < inputDocument.PageCount; i++)
                {
                    var page = inputDocument.Pages[i];
                    outputDocument.AddPage(page);
                }
            }
            
            outputDocument.Save(outputFilePath);
            return outputFilePath;
        });
    }

    public async Task<string> CompressPdfAsync(string pdfPath, string outputFilePath)
    {
        return await Task.Run(() =>
        {
            using var inputDocument = PdfReader.Open(pdfPath, PdfDocumentOpenMode.Import);
            using var outputDocument = new PdfDocument();
            
            outputDocument.Options.CompressContentStreams = true;
            outputDocument.Options.NoCompression = false;
            outputDocument.Options.FlateEncodeMode = PdfFlateEncodeMode.BestCompression;
            
            for (int i = 0; i < inputDocument.PageCount; i++)
            {
                var page = inputDocument.Pages[i];
                outputDocument.AddPage(page);
            }
            
            outputDocument.Save(outputFilePath);
            return outputFilePath;
        });
    }

    public async Task<string> SplitPdfAsync(string pdfPath, string outputDir, string pageRanges)
    {
        return await Task.Run(() =>
        {
            using var inputDocument = PdfReader.Open(pdfPath, PdfDocumentOpenMode.Import);
            
            if (string.IsNullOrWhiteSpace(pageRanges) || pageRanges.Trim().ToLower() == "all")
            {
                for (int i = 0; i < inputDocument.PageCount; i++)
                {
                    using var outputDocument = new PdfDocument();
                    outputDocument.AddPage(inputDocument.Pages[i]);
                    outputDocument.Save(Path.Combine(outputDir, $"page_{i + 1}.pdf"));
                }
            }
            else
            {
                var pagesToExtract = ParseRanges(pageRanges, inputDocument.PageCount);
                using var outputDocument = new PdfDocument();
                foreach (var p in pagesToExtract)
                {
                    if (p > 0 && p <= inputDocument.PageCount)
                    {
                        outputDocument.AddPage(inputDocument.Pages[p - 1]);
                    }
                }
                outputDocument.Save(Path.Combine(outputDir, "extracted.pdf"));
            }

            return outputDir;
        });
    }

    private List<int> ParseRanges(string rangeStr, int maxPages)
    {
        var result = new HashSet<int>();
        var lower = (rangeStr ?? "").Trim().ToLower();

        if (lower == "odd")
        {
            for (int i = 1; i <= maxPages; i += 2) result.Add(i);
            return result.OrderBy(x => x).ToList();
        }

        if (lower == "even")
        {
            for (int i = 2; i <= maxPages; i += 2) result.Add(i);
            return result.OrderBy(x => x).ToList();
        }

        var parts = (rangeStr ?? "").Split(',');
        foreach (var part in parts)
        {
            var p = part.Trim();
            if (p.Contains('-'))
            {
                var subParts = p.Split('-');
                if (subParts.Length == 2 && int.TryParse(subParts[0], out int start) && int.TryParse(subParts[1], out int end))
                {
                    for (int i = start; i <= end; i++) result.Add(i);
                }
            }
            else if (int.TryParse(p, out int single))
            {
                result.Add(single);
            }
        }
        return result.OrderBy(x => x).ToList();
    }
}
