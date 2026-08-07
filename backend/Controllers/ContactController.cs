using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Net.Http.Headers;

namespace PDFora.Backend.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<ContactController> _logger;
    private readonly IHttpClientFactory _httpClientFactory;

    public ContactController(IConfiguration configuration, ILogger<ContactController> logger, IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClientFactory = httpClientFactory;
    }

    [HttpPost]
    public async Task<IActionResult> SubmitContactForm([FromBody] ContactRequest request)
    {
        var errors = new Dictionary<string, string>();
        if (string.IsNullOrWhiteSpace(request.Name)) errors["name"] = "Name is required.";
        if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains("@")) errors["email"] = "Valid email is required.";
        if (string.IsNullOrWhiteSpace(request.Topic)) errors["topic"] = "Topic is required.";
        if (string.IsNullOrWhiteSpace(request.Message) || request.Message.Length < 20) errors["message"] = "Message must be at least 20 characters.";

        if (errors.Any())
        {
            return BadRequest(new { success = false, errors });
        }

        try
        {
            var apiKey = _configuration["RESEND_API_KEY"];
            if (string.IsNullOrEmpty(apiKey))
            {
                _logger.LogError("RESEND_API_KEY is not configured.");
                return StatusCode(500, new { success = false, error = "Email service is not configured properly." });
            }

            var toEmail = _configuration["TO_EMAIL"] ?? "contact@nimradev.site";

            var emailHtml = $@"
                <table style='font-family:sans-serif;font-size:14px;color:#18181B;max-width:560px;width:100%;border-collapse:collapse'>
                  <tr><td style='padding:24px'>
                    <p style='margin:0 0 8px'><strong>Name:</strong> {request.Name}</p>
                    <p style='margin:0 0 8px'><strong>Email:</strong> {request.Email}</p>
                    <p style='margin:0 0 8px'><strong>Topic:</strong> {request.Topic}</p>
                    <hr style='border:none;border-top:1px solid #F1D5E3;margin:16px 0'/>
                    <p style='margin:0 0 8px'><strong>Message:</strong></p>
                    <p style='margin:0;white-space:pre-wrap;line-height:1.6'>{request.Message}</p>
                  </td></tr>
                </table>";

            var payload = new
            {
                from = "PDFora <contact@nimradev.site>",
                to = new[] { toEmail },
                reply_to = request.Email,
                subject = $"[PDFora Contact] {request.Topic} — {request.Name}",
                html = emailHtml
            };

            using var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var response = await client.PostAsJsonAsync("https://api.resend.com/emails", payload);
            
            if (response.IsSuccessStatusCode)
            {
                return Ok(new { success = true });
            }
            else
            {
                var errorResponse = await response.Content.ReadAsStringAsync();
                _logger.LogError("Resend API returned an error: {ErrorResponse}", errorResponse);
                return StatusCode(500, new { success = false, error = "Email sending failed from provider." });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send contact email.");
            return StatusCode(500, new { success = false, error = "Failed to send email. Please try again." });
        }
    }
}

public class ContactRequest
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Topic { get; set; }
    public string? Message { get; set; }
}
