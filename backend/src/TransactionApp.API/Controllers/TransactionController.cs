using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TransactionApp.Application.Common.DTOs;
using TransactionApp.Application.Common.Interfaces;

namespace TransactionApp.API.Controllers;

[ApiController]
[Route("api/transactions")]
[Authorize]
public class TransactionController(ITransactionService transactionService, ITimezoneService timezoneService) : ControllerBase
{
    [HttpPost("submit")]
    public async Task<IActionResult> Submit([FromBody] SubmitTransactionDto dto)
    {
        var userId = GetUserId();
        var result = await transactionService.SubmitAsync(userId, dto);
        return Ok(result);
    }

    [HttpGet("approved")]
    public async Task<IActionResult> GetApproved()
    {
        var userId = GetUserId();
        var result = await transactionService.GetApprovedAsync(userId);
        return Ok(result);
    }

    [HttpGet("regions")]
    [AllowAnonymous]
    public IActionResult GetRegions() => Ok(timezoneService.GetSupportedRegions());

    [HttpGet("current-time/{region}")]
    [AllowAnonymous]
    public IActionResult GetCurrentTime(string region)
    {
        var localTime = timezoneService.GetCurrentLocalTime(region);
        return Ok(new { time = localTime.ToString("HH:mm") });
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("User not authenticated."));
}
