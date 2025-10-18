@echo off

:: HUOM: Tämä skripti vaatii .NET SDK:n toimiakseen.
:: Jos dotnet-serve -työkalua ei ole asennettu, suorita ensin komento:
:: dotnet tool install --global dotnet-serve

echo.
echo Käynnistetään paikallinen web-palvelin...
echo Avaa selain ja mene osoitteeseen http://localhost:9091
echo.
start http://localhost:9091/
dotnet serve --port 9091