public async Task SelectStampcategoryAsync(int id)
{
    IdRequest request = new(state.LoginToken, id);
    Stampcategory = await state.Services.StampcategoryAsync(request);
}