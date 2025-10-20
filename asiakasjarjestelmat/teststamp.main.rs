use chrono::Local;
use tokio::time::{sleep, Duration};
use std::env;
use std::fs::OpenOptions;
use std::io::Write;

#[tokio::main]
async fn main() -> Result<(), reqwest::Error> {
    // Luetaan komentoriviparametrit
    let args: Vec<String> = env::args().collect();

    // Tarkistetaan, onko parametreja tarpeeksi.
    if args.len() < 3 {
        eprintln!("Virhe: Vaadittuja parametreja ei annettu.");
        eprintln!("Käyttö: {} <kierrosten_määrä> <lokin_tunniste>", args.get(0).map_or("teststamp", |s| s.as_str()));
        eprintln!("Esimerkki: {} 100 1", args.get(0).map_or("teststamp", |s| s.as_str()));
        return Ok(());
    }

    let count: usize = match args[1].parse() {
        Ok(num) if num > 0 => num,
        _ => {
            eprintln!("Virhe: Annettu kierrosten määrä '{}' ei ole kelvollinen positiivinen luku.", args[1]);
            return Ok(());
        }
    };

    let log_id = &args[2];
    let log_filename = format!("logs/{}.log", log_id);
    let mut log_file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_filename)
        .expect("Lokitiedostoa ei voitu avata.");

    writeln!(log_file, "--- Testiajo aloitettu {} ---", Local::now().to_rfc3339()).unwrap();

    // Yritetään hakea login-token asetustiedostosta.
    // Jos sitä ei löydy, tulostetaan virhe ja poistutaan.
    let login_token = match shared_api::methods::get_setting("settings.txt", "device_token") {
        Some(token) => {
            println!("Käytetään login-tokenia asetustiedostosta.");
            token
        }
        None => {
            eprintln!("Virhe: login-tokenia ei löytynyt asetustiedostosta (settings.txt).\nLisää 'device_token=YOUR_TOKEN' tiedostoon ja yritä uudelleen.");
            writeln!(log_file, "Virhe: login-tokenia ei löytynyt asetustiedostosta.").unwrap();
            return Ok(());
        }
    };

    // Lue palvelimen osoite asetuksista, käytä oletusarvoa jos ei löydy.
    let server_url = shared_api::methods::get_setting("settings.txt", "server_url")
        .unwrap_or_else(|| "https://testi.aikaleima.fi".to_string());

    let init_msg1 = format!("Palvelin: {}", server_url);
    let init_msg2 = format!("Aloitetaan {} leimauksen lähetys sekunnin välein. Lokitiedosto: {}", count, log_filename);
    println!("{}", init_msg1);
    println!("{}", init_msg2);
    writeln!(log_file, "{}", init_msg1).unwrap();
    writeln!(log_file, "{}", init_msg2).unwrap();

    for i in 1..=count {
        let request = shared_api::requests::StampingRequest {
            login_token: login_token.clone(),
            id: 0,
            device_name: "Kuormitustesti".to_string(),
            // Haetaan nykyinen aika ja muotoillaan se haluttuun string-muotoon.
            timestamp: Local::now().format("%d.%m.%Y %H.%M.%S").to_string(),
            stamper_key: "Kuormitustestileimaaja".to_string(),
            stampcategory_key: "kuormitutustesti".to_string(),
            latitude: "".to_string(),
            longitude: "".to_string(),
        };

        let send_msg = format!("\n[#{}] Lähetetään leimaus...", i);
        println!("{}", send_msg);
        writeln!(log_file, "{}", send_msg).unwrap();

        let response = reqwest::Client::new()
            .post(format!("{}/{}", server_url, shared_api::api_calls::SAVE_STAMP))
            .json(&request)
            .send()
            .await?;

        if response.status().is_success() {
            let success_msg = format!("[#{}] Leimauspyyntö onnistui (HTTP Status: {}).", i, response.status());
            println!("{}", success_msg);
            writeln!(log_file, "{}", success_msg).unwrap();
        } else {
            let status = response.status();
            let error_text = response.text().await?;
            let fail_msg1 = format!("[#{}] Pyyntö epäonnistui, status: {}", i, status);
            let fail_msg2 = format!("Virheen sisältö:\n{}", error_text);
            println!("{}", fail_msg1);
            println!("{}", fail_msg2);
            writeln!(log_file, "{}", fail_msg1).unwrap();
            writeln!(log_file, "{}", fail_msg2).unwrap();
        }

        // Odotetaan sekunti ennen seuraavaa lähetystä.
        sleep(Duration::from_secs(1)).await;
    }

    Ok(())
}
