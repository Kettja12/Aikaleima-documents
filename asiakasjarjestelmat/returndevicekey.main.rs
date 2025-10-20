use std::io;

#[tokio::main]
async fn main() -> Result<(), reqwest::Error> {
    let mut login_token_input = String::new();

    if login_token_input.is_empty() {
        println!("Syötä login-token:");
        io::stdin()
            .read_line(&mut login_token_input)
            .expect("Rivinvaihtoa ei voitu lukea");
    }
    let login_token = login_token_input.trim();


    let request = shared_api::requests::Request {
        login_token: login_token
    };

    // Lue palvelimen osoite asetuksista, käytä oletusarvoa jos ei löydy.
    let server_url = shared_api::methods::get_setting("settings.txt", "server_url")
        .unwrap_or_else(|| "https://testi.aikaleima.fi".to_string());

    println!("Lähetetään data palvelimelle...");
    println!("Palvelin: {}", server_url);

    let response = reqwest::Client::new()
        .post(format!("{}/{}", server_url, shared_api::api_calls::DEVICE_LOG_IN))
        .json(&request)
        .send()
        .await?;

    if response.status().is_success() {
        // Jäsennetään vastaus suoraan DeviceResponse-structiksi.
        // Tämä onnistuu nyt, kun struct vastaa JSON-dataa.
        let device_response: shared_api::responces::DeviceResponse = response.json().await?;
        println!("Vastaus palvelimelta (jäsennetty):");
        println!("{:#?}", device_response);

        // Tallennetaan kaikki vastauksen kentät asetustiedostoon
        println!("Päivitetään asetustiedostoa settings.txt...");
        if let Err(e) = shared_api::methods::save_device_response_settings("settings.txt", &device_response) {
            println!("Virhe asetusten tallennuksessa: {}", e);
        } else {
            println!("Asetukset tallennettu onnistuneesti.");
        }
    } else {
        println!("Pyyntö epäonnistui, status: {}", response.status());
        let error_text = response.text().await?;
        println!("Virheen sisältö:\n{}", error_text);
    }

    Ok(())
}
