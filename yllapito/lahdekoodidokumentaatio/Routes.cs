using Shared;

public static partial class Routes
{
    public static void MapRoutes(this WebApplication app)
    {
        app.MapPost('/' + APICalls.DeviceLogIn, (Services services,Request request) =>
        {
            return services.DeviceLoginAsync(request);
        });
        app.MapPost('/' + APICalls.StampcategoryNames, (Services services, Request request) =>
        {
            return services.StampcategoryNamesAsync(request);
        });
        app.MapPost('/' + APICalls.SaveStampAsync, (Services services, StampingRequest request) =>
        {
            return services.SaveStampAsync(request);
        });

        app.MapGet("/download/timestamp.apk", () =>
        {
            var apkFolder = Path.Combine(app.Environment.ContentRootPath, "PrivateFiles");
            var safeName = Path.GetFileName("fi.aikaleima.timestamp.apk");
            var filePath = Path.Combine(apkFolder, safeName);

            if (!File.Exists(filePath)) return Results.NotFound();

            var stream = File.OpenRead(filePath);

            return Results.File(stream,
                                contentType: "application/vnd.android.package-archive",
                                fileDownloadName: safeName,
                                enableRangeProcessing: true);
        });
        app.MapPost('/' + APICalls.UserLogIn, (Services services, Request request) =>
        {
            return services.LoginAsync(request);
        });
        app.MapPost('/' + APICalls.Stamps, (Services services, Request request) =>
        {
            return services.StampsAsync(request);
        });

    }
}
