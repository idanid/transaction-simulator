using TransactionApp.Application.Common.DTOs;

namespace TransactionApp.Application.Common.Interfaces;

public interface ITransactionService
{
    Task<TransactionResultDto> SubmitAsync(int userId, SubmitTransactionDto dto);
    Task<IEnumerable<ApprovedTransactionDto>> GetApprovedAsync(int userId);
}
