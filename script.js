function calculate() {
  let V = document.getElementById("voltage").value;
  let R = document.getElementById("resistance").value;

  let I = V / R;

  document.getElementById("result").innerText =
    "Current = " + I + " Amps";
}

if (V == "" || R == "") {
  alert("Enter all values");
  return;
}