window.addEventListener("load", EventBinding)

function EventBinding() {
    currencyOptions()
    errorMsg.style.display = "none";
    document.querySelector(".convert").addEventListener("click", convertFunc)
    document.querySelector(".reset").addEventListener("click", reset)
    document.querySelector(".exchange").addEventListener("click", exchange)
}

const fromCurr = document.getElementById("fromCurrency")
const toCurr = document.getElementById("toCurrency")
const errorMsg = document.querySelector(".error")
const result = document.querySelector(".result")

const url = `https://v6.exchangerate-api.com/v6/b56681b50ec1b93285af274a/latest/USD`

async function currencyOptions() {
    try {
        const response = await fetch(url)
        const data = await response.json()
        const currencies = Object.keys(data.conversion_rates);

        console.log("fetching is successful",data)

        currencies.forEach((currency) => {
            const option1 = document.createElement('option');
            option1.value = currency;
            option1.textContent = currency;
            if (currency === "USD") {
                option1.selected = true
            }
            fromCurr.append(option1)
        })

        currencies.forEach((currency) => {
            const option2 = document.createElement('option');
            option2.value = currency;
            option2.textContent = currency;
            if (currency === "INR") {
                option2.selected = true
            }
            toCurr.append(option2)

        })
    } catch (error) {
        displayError(error.message); 
    }
}

async function convertFunc() {
    try {
        const amount = parseFloat(document.querySelector("#amount").value);

        if (isNaN(amount) || amount <= 0) {
            displayError("Please enter a valid amount greater than 0");
            return;
        }

        const from = fromCurr.value;
        const to = toCurr.value;

        const data = await fetchWithTimeout(url,5000);
        const fromRate = data.conversion_rates[from];
        const toRate = data.conversion_rates[to];
        const totalAmount = (amount / fromRate) * toRate;

        result.innerHTML = `${amount} ${from} = ${totalAmount.toFixed(2)} ${to}`;
        errorMsg.style.display = "none";
    } catch (error) {
        displayError("Error fetching conversion rates. Please try again later.");
    }
}

function reset() {
    const amount = document.querySelector("#amount")
    amount.value = "";
    fromCurr.value = "USD"
    toCurr.value = "INR"
    result.innerHTML = ""
    errorMsg.innerHTML = ""
}

function displayError(msg) {
    if (errorMsg) {
        errorMsg.innerHTML = `${msg}`;
        errorMsg.style.display = "block";
    } else {
        console.error("Error element not found in the DOM");
    }
}

function exchange() {
    const temp = fromCurr.value;
    fromCurr.value = toCurr.value
    toCurr.value = temp;
}

function fetchWithTimeout(url, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    return fetch(url, { signal: controller.signal })
        .then((response) => {
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .catch((error) => {
            if (error.name === "AbortError") {
                throw new Error("Request timed out after 5 seconds");
            }
            throw error;
        });
}
