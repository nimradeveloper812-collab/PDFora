using Microsoft.AspNetCore.Http.Features;
using PDFora.Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Configure large file uploads
builder.Services.Configure<FormOptions>(options =>
{
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartBodyLengthLimit = 150L * 1024 * 1024; // 150MB max total request size
    options.MemoryBufferThreshold = int.MaxValue;
});

builder.Services.AddControllers();
builder.Services.AddHttpClient();

// Add CORS with origin restrictions for production
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? new[]
{
    "https://pdfora.nimradev.site",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5089"
};

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .WithExposedHeaders("Content-Disposition", "Content-Type");
        }
        else
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .WithExposedHeaders("Content-Disposition", "Content-Type");
        }
    });
});

// Register services
builder.Services.AddSingleton<ILibreOfficeService, LibreOfficeService>();
builder.Services.AddSingleton<IImageConversionService, ImageConversionService>();
builder.Services.AddSingleton<IPdfManipulationService, PdfManipulationService>();

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors();

// Serve the React frontend from wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthorization();
app.MapControllers();

// Health Check Endpoint
app.MapGet("/api/health", () => new { status = "ok" });

// Fallback to index.html for React Router SPA
app.MapFallbackToFile("index.html");

app.Run();
