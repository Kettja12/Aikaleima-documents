using Shared;

public partial class State
{
    public Services Services;
    public State(Services services)
    {
        Services = services;
    }
    public bool Loaded { get; set; }
    public async Task InitializeState()
    {
        await LoadSettingsAsync();
        await LoadUsersByUser();
        await LoadStampersByUserAsync();
        await LoadDevicesByUserAsync();
        await LoadStampcategoriesByUserAsync();
    }


    public string MessageType { get; set; } = "";
    public string MessageContent { get; set; } = "";
    public int Refresh { get; set; } = 0;

    public LocalStorageData LocalStorage { get; set;} = new();
    public class LocalStorageData
    {
        public string UserToken { get; set; } = "";
        public string DeviceToken { get; set; } = "";
        public LocalStorageData()
        {

        }
        public LocalStorageData(string content)
        {
            if (string.IsNullOrEmpty(content)) return;

            try
            {
                var bytes = Convert.FromBase64String(content);
                var jsonString = System.Text.Encoding.UTF8.GetString(bytes);
                var data = System.Text.Json.JsonSerializer.Deserialize<LocalStorageData>(jsonString);
                if (data != null)
                {
                    UserToken = data.UserToken;
                    DeviceToken = data.DeviceToken;
                }
            }
            catch
            {
                UserToken = "";
                DeviceToken = "";
            }
        }

        public LocalStorageData(string userToken, string deviceToken)
        {
            UserToken = userToken;
            DeviceToken = deviceToken;
        }
       
        public string toBinaryString() { 
                var s= System.Text.Json.JsonSerializer.Serialize(this);
                var bytes = System.Text.Encoding.UTF8.GetBytes(s);
                return Convert.ToBase64String(bytes);
        }
    };
}