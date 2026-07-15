FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/TransactionApp.API/TransactionApp.API.csproj", "src/TransactionApp.API/"]
COPY ["src/TransactionApp.Application/TransactionApp.Application.csproj", "src/TransactionApp.Application/"]
COPY ["src/TransactionApp.Domain/TransactionApp.Domain.csproj", "src/TransactionApp.Domain/"]
COPY ["src/TransactionApp.Infrastructure/TransactionApp.Infrastructure.csproj", "src/TransactionApp.Infrastructure/"]
RUN dotnet restore "src/TransactionApp.API/TransactionApp.API.csproj"
COPY . .
RUN dotnet publish "src/TransactionApp.API/TransactionApp.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TransactionApp.API.dll"]
