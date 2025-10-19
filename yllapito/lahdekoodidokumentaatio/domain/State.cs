using Shared;

public partial class State
{
    public Services Services;
    public State(Services services)
    {
        this.Services = services;
    }
    public bool Loaded { get; set; }
    public string LoginToken
    {
        get
        {
            if (User.Token != "") return User.Token;
            if (Device.LoginToken != "") return Device.LoginToken;
            return "";
        }

    }

    public string MessageType { get; set; } = "";
    public string MessageContent { get; set; } = "";
    public int Refresh { get; set; } = 0;



}