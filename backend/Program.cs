using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Configuration;
using PDFora.Backend.Services;

// Use CreateEmptyBuilder to prevent default FileSystemWatcher / inotify allocations in Linux containers
var builder = WebApplication.CreateEmptyBuilder(new WebApplicationOptions
{
    Args = args,
    ContentRootPath = AppContext.BaseDirectory,
    WebRootPath = Path.Combine(AppContext.BaseDirectory, "wwwroot")
});

// Add configuration without any file watchers (reloadOnChange: false)
builder.Configuration
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
    .AddEnvironmentVariables();

// Configure Kestrel web server with dynamic port binding for Render
builder.WebHost.UseKestrel();
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Core services
builder.Services.AddRouting();
builder.Services.Configure<FormOptions>(options =>
{
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartBodyLengthLimit = 150L * 1024 * 1024; // 150MB max total request size
    options.MemoryBufferThreshold = int.MaxValue;
});

builder.Services.AddControllers();
builder.Services.AddHttpClient();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader()
              .WithExposedHeaders("Content-Disposition", "Content-Type");
    });
});

// Register services
builder.Services.AddSingleton<ILibreOfficeService, LibreOfficeService>();
builder.Services.AddSingleton<IImageConversionService, ImageConversionService>();
builder.Services.AddSingleton<IPdfManipulationService, PdfManipulationService>();

var app = builder.Build();

app.UseRouting();
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
