// Krótkie opisy zabiegów pokazywane w oknie „Dowiedz się więcej” przy pakietach.
// Dopasowanie idzie po nazwie zabiegu (pierwszy pasujący wzorzec wygrywa), więc kolejność
// ma znaczenie: bardziej szczegółowe wzorce muszą stać przed ogólnymi.
// Opisy bazują na treściach ze strony (FAQ, „Dobierz pielęgnację”) – warto, żeby
// właścicielka je przejrzała i poprawiła, jeśli któryś odbiega od tego, jak zabieg wygląda u niej.

const treatments = [
  {
    test: /mikroigł/i,
    text: 'Mezoterapia mikroigłowa z użyciem BioPen: frakcyjne mikronakłucia naskórka z jednoczesnym wprowadzeniem składników aktywnych i fototerapią LED. Pobudza skórę do produkcji kolagenu, wygładza teksturę i zwęża pory.',
    duration: 'ok. 50–60 min',
  },
  {
    test: /bezigł/i,
    text: 'Prądy i ultradźwięki wprowadzają składniki aktywne w głąb skóry – bez nakłuć. Nawilża, rozświetla i poprawia elastyczność.',
    duration: 'ok. 50 min',
  },
  {
    test: /igłow/i,
    text: 'Witaminy i kwas hialuronowy podawane bezpośrednio w skórę właściwą: głębokie nawilżenie, regeneracja i ujędrnienie. Przed zabiegiem skórę znieczulamy kremem z lidokainą.',
    duration: 'ok. 50 min',
  },
  {
    test: /peeling kawit/i,
    text: 'Delikatne oczyszczanie skóry ultradźwiękami: usuwa martwy naskórek i zanieczyszczenia, wygładza i przygotowuje skórę na kolejne zabiegi.',
  },
  {
    test: /radiofrekw|\brf\b/i,
    text: 'Ciepło fal radiowych pobudza skórę do produkcji kolagenu. Poprawia jędrność i unosi kontur twarzy – bez igieł i bez okresu rekonwalescencji.',
  },
  {
    test: /kobido|masaż twarzy/i,
    text: 'Masaż twarzy techniką manualną: rozluźnia napięcie, poprawia ukrwienie i pomaga unieść kontur twarzy.',
  },
  {
    test: /mikrodermabr/i,
    text: 'Delikatna eksfoliacja głowicą diamentową: wygładza skórę, pory stają się mniej widoczne, a skóra lepiej wchłania preparaty pielęgnacyjne.',
    duration: 'ok. 45 min',
  },
  {
    test: /bankiet/i,
    text: 'Ekspresowe wygładzenie i nawilżenie cery przed ważnym wyjściem – natychmiastowy blask bez przestoju.',
    duration: 'ok. 55 min',
  },
  {
    test: /stymulacj/i,
    text: 'Zabieg pobudzający skórę do odnowy: poprawia napięcie i jędrność.',
  },
  {
    test: /masaż stóp/i,
    text: 'Relaksujący masaż stóp na zakończenie pedicure.',
  },
  {
    test: /pedicure spa/i,
    text: 'Pedicure z pielęgnacją SPA: zadbane paznokcie, miękka i wygładzona skóra stóp.',
  },
  {
    test: /pedicure hybryd/i,
    text: 'Pedicure z trwałym lakierem hybrydowym – estetyczny kolor na kilka tygodni.',
  },
  {
    test: /maska/i,
    text: 'Maska dobrana do potrzeb skóry: nawilża, koi i przedłuża efekt zabiegu.',
  },
  {
    test: /1:1/,
    text: 'Do każdej naturalnej rzęsy przyklejana jest jedna sztuczna – lekki, naturalny efekt.',
  },
  {
    test: /2\/3d|2–3d/i,
    text: 'Do każdej rzęsy przyklejany jest lekki wachlarz 2–3 cienkich rzęs – większa objętość i gęstsze spojrzenie.',
  },
  {
    test: /laminacj/i,
    text: 'Laminacja układa i unosi włoski brwi, nadając im wyrazisty, uporządkowany kształt.',
  },
  {
    test: /stylizacja brwi/i,
    text: 'Regulacja kształtu brwi z koloryzacją farbką lub henną.',
  },
]

export function describeTreatment(name) {
  const text = String(name ?? '')
  return treatments.find((item) => item.test.test(text)) ?? null
}
