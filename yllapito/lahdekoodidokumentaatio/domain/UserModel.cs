using Shared;
public partial class State
{
    public UserResponse RequestedUser { get; set; } = new();

    public UserResponse User { get; set; } = new();

    UserModel? userModel;
    public UserModel UserModel
    {
        get
        {
            if (userModel == null) userModel = new(this);
            return userModel;
        }
    }

}

public class UserModel
{
    public UserResponse User = new();

    State state;
    public UserModel(State state)
    {
        this.state = state;
    }

    public async Task SelectUserAsync(int id)
    {
        IdRequest request = new(state.LoginToken, id);
        User = await state.Services.UserAsync(request);
    }

    public string SendRegistrationKeyDisabled
    {
        get { return User.Id == 0?"True":"False";}
    }

    public async Task SendRegistrationKey()
    {
        await SaveUser();
        SendUserRegistrationRequest request = new(state.LoginToken, User);
        var response = await state.Services.SendUserRegistrationAsync(request);
        User = response.User;
    }
    public void AddUser()
    {
        User = new();
    }
    public async Task SaveUser()
    {
        UserSaveRequest request = new(state.LoginToken, User);
        User = await state.Services.SaveUserAsync(request);
        if (User.Status == "")
        {
            state.MessageType = MessageModel.AlertInfo;
            state.MessageContent = Shared.ResponseMessages.SaveSuccess;
            state.Refresh++;
        }

        if (User.Status != "")
        {
            state.MessageType = MessageModel.AlertWarning;
            state.MessageContent = User.Status;
            state.Refresh++;
        }
    }

}

