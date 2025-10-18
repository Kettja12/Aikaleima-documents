using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.HttpOverrides;
using ssr.Components;
using System.Net;

var builder = WebApplication.CreateBuilder(args);
var sqlitedbPath = builder.Configuration.GetConnectionString("SQLiteConnection");
builder.Services.AddDbContextFactory<AppDbContext>((sp, options) => { 
    options.UseSqlite(sqlitedbPath);
    options.EnableSensitiveDataLogging();
});

//builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddScoped<Services>();
builder.Services.AddScoped<IndexedDbAccessor>();
builder.Services.AddScoped<State>();
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownProxies.Add(IPAddress.Parse("127.0.0.1")); // add nginx IP(s)
});
builder.Services.AddLocalization();
var app = builder.Build();

app.UseRequestLocalization("fi-FI");
// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseForwardedHeaders();
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
else
{
    app.UseForwardedHeaders();
}
app.Use(async (context, next) =>
{
    if (context.Request.Headers.TryGetValue("X-Forwarded-Prefix", out var prefix) &&
        !string.IsNullOrWhiteSpace(prefix))
    {
        var p = prefix.ToString();
        if (!p.StartsWith('/')) p = "/" + p;
        context.Request.PathBase = new PathString(p.TrimEnd('/'));
    }
    await next();
});

app.MapRoutes();
app.UseStatusCodePagesWithReExecute("/not-found", createScopeForStatusCodePages: true);

//app.UseHttpsRedirection();

app.UseAntiforgery();

app.MapStaticAssets();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();
