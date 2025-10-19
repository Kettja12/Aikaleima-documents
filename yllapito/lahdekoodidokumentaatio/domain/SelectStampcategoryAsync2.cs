 public async Task<Stampcategory> SelectStampcategoryAsync(int id)
 {
	IdRequest request = new(state.LoginToken, id);
    return await state.Services.StampcategoryAsync(request);
 }