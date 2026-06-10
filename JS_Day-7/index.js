class LandParcel {
    constructor(id, owner, rawValue, taxRate) {
        this.id = id;
        this.owner = owner;
        this.rawValue = rawValue;
        this.taxRate = taxRate;
    }
    calculateBaseTax() {
        return this.rawValue * this.taxRate;
    }
}
class DevelopedParcel extends LandParcel {
    constructor(id, owner, rawValue, taxRate, structureValue) {
        super(id, owner, rawValue, taxRate);
        this.structureValue = structureValue;
    }
    calculateTotalAssessment() {
        let baseTax = this.calculateBaseTax();
        let structureTax = this.structureValue * (this.taxRate * 1.5);
        return baseTax + structureTax;
    }
}
const toggleSystemBtn = document.getElementById("toggleSystemBtn");
const registryContainer = document.getElementById("registryContainer");
const cards = document.querySelectorAll(".parcel-card");
toggleSystemBtn.onclick = function() {
    if (registryContainer.style.display === "none") {
        registryContainer.style.display = "grid";
        toggleSystemBtn.textContent = "Power Off Registry";
        toggleSystemBtn.style.backgroundColor = "#ef4444";
    } else {
        registryContainer.style.display = "none";
        toggleViewBtn;
        toggleSystemBtn.textContent = "Power On Registry";
        toggleSystemBtn.style.backgroundColor = "#22c55e";
    }
};
const parcelInstances = [
    new DevelopedParcel("Parcel #RL-402", "Sai Naga Registry", 180000, 0.05, 75000),
    new DevelopedParcel("Parcel #CL-709", "Piyush Holdings", 450000, 0.10, 250000)
];
let index = 0;
while (index < cards.length) {
    const currentCard = cards[index];
    const currentParcel = parcelInstances[index];
    
    const targetButton = currentCard.querySelector(".calc-btn");
    const targetResult = currentCard.querySelector(".result-box");

    targetButton.onclick = function() {
        let finalAssessment = currentParcel.calculateTotalAssessment();
        targetResult.textContent = `Assessed Fee: $${finalAssessment.toFixed(2)}`;
    };

    index++;
}