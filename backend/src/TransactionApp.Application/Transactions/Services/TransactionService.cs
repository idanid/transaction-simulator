using TransactionApp.Application.Common.DTOs;
using TransactionApp.Application.Common.Interfaces;
using TransactionApp.Domain.Entities;

namespace TransactionApp.Application.Transactions.Services;

public class TransactionService(
    ITransactionRepository transactionRepo,
    ITimezoneService timezoneService) : ITransactionService
{
    public async Task<TransactionResultDto> SubmitAsync(int userId, SubmitTransactionDto dto)
    {
        if (!TimeOnly.TryParseExact(dto.Time, "HH:mm", out var enteredTime))
            throw new ArgumentException("Invalid time format. Use HH:mm.");

        var (status, localTime) = timezoneService.Evaluate(dto.Region, enteredTime);

        var transaction = new Transaction
        {
            UserId = userId,
            Region = dto.Region,
            SubmittedAtUtc = DateTime.UtcNow,
            LocalTime = localTime,
            Status = status
        };

        await transactionRepo.CreateAsync(transaction);

        return new TransactionResultDto(
            status.ToString(),
            localTime.ToString("HH:mm"),
            dto.Region);
    }

    public async Task<IEnumerable<ApprovedTransactionDto>> GetApprovedAsync(int userId)
    {
        var transactions = await transactionRepo.GetApprovedByUserAsync(userId);
        return transactions.Select(t => new ApprovedTransactionDto(
            t.Id,
            t.Region,
            t.LocalTime.ToString("HH:mm"),
            t.SubmittedAtUtc));
    }
}
