using TimeZoneConverter;
using TransactionApp.Application.Common.Interfaces;
using TransactionApp.Domain.Enums;

namespace TransactionApp.Infrastructure.Services;

public class TimezoneService : ITimezoneService
{
    private static readonly Dictionary<string, string> RegionTimezones = new(StringComparer.OrdinalIgnoreCase)
    {
        { "France", "Europe/Paris" },
        { "Israel", "Asia/Jerusalem" },
        { "Cyprus", "Asia/Nicosia" },
        { "Italy",  "Europe/Rome" }
    };

    public (TransactionStatus status, TimeOnly localTime) Evaluate(string region, TimeOnly enteredTime)
    {
        if (!RegionTimezones.ContainsKey(region))
            throw new ArgumentException($"Unsupported region: {region}");

        var isBankingHours = enteredTime.Hour >= 8 && enteredTime.Hour < 18;
        return (isBankingHours ? TransactionStatus.Approved : TransactionStatus.Rejected, enteredTime);
    }

    public TimeOnly GetCurrentLocalTime(string region)
    {
        if (!RegionTimezones.TryGetValue(region, out var tzId))
            throw new ArgumentException($"Unsupported region: {region}");

        var tz = TZConvert.GetTimeZoneInfo(tzId);
        var localNow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);
        return TimeOnly.FromDateTime(localNow);
    }

    public IEnumerable<string> GetSupportedRegions() => RegionTimezones.Keys;
}
