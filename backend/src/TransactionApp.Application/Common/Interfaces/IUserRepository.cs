using TransactionApp.Domain.Entities;

namespace TransactionApp.Application.Common.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User> CreateAsync(User user);
    Task<bool> ExistsAsync(string email);
}
