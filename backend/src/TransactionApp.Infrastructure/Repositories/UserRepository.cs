using Microsoft.EntityFrameworkCore;
using TransactionApp.Application.Common.Interfaces;
using TransactionApp.Domain.Entities;
using TransactionApp.Infrastructure.Data;

namespace TransactionApp.Infrastructure.Repositories;

public class UserRepository(AppDbContext db) : IUserRepository
{
    public Task<User?> GetByEmailAsync(string email) =>
        db.Users.FirstOrDefaultAsync(u => u.Email == email);

    public async Task<User> CreateAsync(User user)
    {
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return user;
    }

    public Task<bool> ExistsAsync(string email) =>
        db.Users.AnyAsync(u => u.Email == email);
}
