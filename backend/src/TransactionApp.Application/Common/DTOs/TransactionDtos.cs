namespace TransactionApp.Application.Common.DTOs;

public record SubmitTransactionDto(string Region, string Time);

public record TransactionResultDto(string Status, string LocalTime, string Region);

public record ApprovedTransactionDto(int Id, string Region, string LocalTime, DateTime SubmittedAtUtc);
