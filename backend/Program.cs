using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Configuration;
using PDFora.Backend.Services;

// Completely disable Linux file watchers in containerized environments (Render/Docker)
Environment.SetEnvironmentVariable("DOTNET_USE_POLLING_FILE_WATCHER", "1");
Environment.SetEnvironmentVariable("DOTNET_hostBuilder__reloadConfigOnChange", "false");
Environment.SetEnvironmentVariable("ASPNETCORE_hostBuilder__reloadConfigOnChange", "false");

var builderOptions = new WebApplicationOptions
{
    Args = args,
    ContentRootPath = AppContext.BaseDirectory,
    WebRootPath = Path.Combine(AppContext.BaseDirectory, "wwwroot")
};

var builder = WebApplication.CreateBuilder(builderOptions);

// Prevent inotify instance allocation on configuration files
foreach (var source in builder.Configuration.Sources.OfType<FileConfigurationSource>())
{
    source.ReloadOnChange = false;
}

// Configure dynamic port binding for Render
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Configure large file uploads
builder.Services.Configure<FormOptions>(options =>
{
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartBodyLengthLimit = 150L * 1024 * 1024; // 150MB max total request size
    options.MemoryBufferThreshold = int.MaxValue;
});

builder.Services.AddControllers();
builder.Services.AddHttpClient();

// Add CORS with origin restrictions
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
