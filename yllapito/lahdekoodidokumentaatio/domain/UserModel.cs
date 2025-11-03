using Shared;
public partial class State
{

    public UserResponse LoginUser { get; set; } = new();

    public bool ViewUserLogin { get; set; }
    public async Task<bool> UserLoginAsync(string token)
    {
        if (token == string.Empty)
        {
            Refresh++;
            ViewUserLogin = true;
            return false;
        }
        Request loginRequest = new(token);
        LoginUser = await Services.LoginAsync(loginRequest);
        LocalStorage.UserToken = LoginUser.Token;
        MessageContent = LoginUser.Message;
        MessageType = LoginUser.MessageType;
        Refresh++;

        if (MessageType != MessageTypes.AlertSuccess)
        {
            ViewUserLogin = true;
            return false;
        }
        await InitializeState();
        if (LoginUser.MFA)
        {
            ViewMFA = true;
            Refresh++;
        }
        Loaded = true;
        ViewUserLogin = false;
        Refresh++;
        return true;
    }

    public bool ViewMFA { get; set; }
    public async Task<(bool, string)> UserCheckMFAStateAsync()
    {


        var mfaStatus = await Services.UserCheckMFAStateAsync(new Request(LoginUser.Token));
        MessageContent = mfaStatus.Message;
        MessageType = mfaStatus.MessageType;
        Refresh++;
        if (MessageType != Shared.MessageTypes.AlertSuccess)
        {
            if (MessageContent == "Hyväksytty")

            {
                ViewMFA = false;
                if (LoginUser.Pincode)
                {
                    ViewPinCode = true;
                    return (true, MessageContent);
                }
                Loaded = true;
                return (true, MessageContent);
            }

        }
        return (false, MessageContent);
    }
    public bool ViewPinCode { get; set; }
    public async Task<bool> PincodeLoginAsync(string pincode)
    {
        KeyRequest keyRequest = new(LoginUser.Token, pincode);
        var response = await Services.PinCodeCheckAsync(keyRequest);
        MessageType = response.MessageType;
        MessageContent = response.Message;
        Refresh++;
        if (MessageType == Shared.MessageTypes.AlertWarning)
        {
            ViewPinCode = true;
            return false;
        }
        Loaded = true;
        return true;
    }

    public UserResponse User = new();


    public string Authentication = "Ei päätelaite kirjautumista";


    public async Task SelectUserAsync(int id)
    {
        IdRequest request = new(LoginUser.Token, id);
        User = await Services.UserAsync(request);

        var device = await Services.UserDeviceAsync(request);
        if (device.Id != 0)
        {
            Authentication = $"Kirjautumispäätelaite: {device.Name}";
        }
        else
        {
            Authentication = "Ei päätelaite kirjautumista. Liitä laite käyttäjälle laiteosiossa";
        }
    }

    public string SendRegistrationKeyDisabled
    {
        get { return User.Id == 0?"True":"False";}
    }

    public async Task SendRegistrationKey()
    {
        await SaveUser();
        SendUserRegistrationRequest request = new(LoginUser.Token, User);
        User = await Services.SendUserRegistrationAsync(request);
        MessageType = User.MessageType;
        MessageContent = User.Message;
        Refresh++;
    }
    public void AddUser()
    {
        User = new();
    }
    public async Task SaveUser()
    {
        UserSaveRequest request = new(LoginUser.Token, User);
        User = await Services.SaveUserAsync(request);
        MessageType = User.MessageType;
        MessageContent = User.Message;
        Refresh++;
    }

}

