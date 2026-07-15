using Microsoft.EntityFrameworkCore;
using TransactionApp.Application.Common.Interfaces;
using TransactionApp.Domain.Entities;
using TransactionApp.Domain.Enums;
using TransactionApp.Infrastructure.Data;

namespace TransactionApp.Infrastructure.Repositories;

public class TransactionRepository(AppDbContext db) : ITransactionRepository
{
    public async Task<Transaction> CreateAsync(Transaction transaction)
    {
        db.Transactions.Add(transaction);
        await db.SaveChangesAsync();
        return transaction;
    }

    public Task<IEnumerable<Transaction>> GetApprovedByUserAsync(int userId) =>
        Task.FromResult<IEnumerable<Transaction>>(
            db.Transactions
              .Where(t => t.UserId == userId && t.Status == TransactionStatus.Approved)
              .OrderByDescending(t => t.CreatedAt)
              .AsEnumerable());
}
