@code {
	[Inject] State state { get; set; } = default!;

	[Parameter] public int UserId { get; set; }
	[Parameter] public EventCallback<int> UserChangedAsync { get; set; }

	protected override async Task OnParametersSetAsync()
	{
		await state.UserModel.SelectUserAsync(UserId);
	}
	public async Task SaveUser()
	{
		await state.UserModel.SaveUser();
		if (UserId != state.UserModel.User.Id)
		{
			await UserChangedAsync.InvokeAsync(state.UserModel.User.Id);
		}
	}
	public async Task SendRegistrationKey()
	{
		await state.UserModel.SendRegistrationKey();
	}


}