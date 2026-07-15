using TransactionApp.Domain.Entities;

namespace TransactionApp.Application.Common.Interfaces;

public interface ITransactionRepository
{
    Task<Transaction> CreateAsync(Transaction transaction);
    Task<IEnumerable<Transaction>> GetApprovedByUserAsync(int userId);
}
