using TransactionApp.Domain.Enums;

namespace TransactionApp.Application.Common.Interfaces;

public interface ITimezoneService
{
    (TransactionStatus status, TimeOnly localTime) Evaluate(string region, TimeOnly enteredTime);
    TimeOnly GetCurrentLocalTime(string region);
    IEnumerable<string> GetSupportedRegions();
}
