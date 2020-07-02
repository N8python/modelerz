const parameters = [];
const compartments = [];
const parameterListHTML = document.getElementById("parameters");
const compartmentListHTML = document.getElementById("compartments");
let modelInterval;
let model = { destroy() {} };
document.getElementById("newParameter").onclick = async() => {
    const { value: parameterName } = await Swal.fire({
        title: "Enter Parameter Name:",
        input: "text",
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return 'You need to write something!'
            }
        }
    });
    if (parameterName) {
        parameters.push(parameterName);
        parameterListHTML.innerHTML += `<span class="w3-large">${parameterName}</span>: <input type="number" id="${parameterName}"> <br>`;
    }
}
document.getElementById("newCompartment").onclick = async() => {
    const { value: compartmentName } = await Swal.fire({
        title: "Enter Compartment Name:",
        input: "text",
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return 'You need to write something!'
            }
        }
    });
    if (compartmentName) {
        const { value: compartmentDesc } = await Swal.fire({
            title: "Enter Compartment Description:",
            text: "For example, S -> Susceptible.",
            input: "text",
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return 'You need to write something!'
                }
            }
        });
        if (compartmentDesc) {
            compartments.push({
                name: compartmentName,
                desc: compartmentDesc,
                ins: [],
                outs: []
            })
            compartmentListHTML.innerHTML += `
            <td class="w3-margin">
                <p class="w3-large">${compartmentName} (${compartmentDesc}):</p>
                <span class="w3-large">Initial Value:</span> <input id="${compartmentName}initVal" type="number"><br>
                <span class="w3-large">Color:</span> <input id="${compartmentName}Color" type="color">
                <h3>Ins:</h3>
                <div id="${compartmentName}Ins">
                </div>
                <button class="w3-btn w3-border w3-round-xlarge styled-btn" id="${compartmentName}AddIn">Add In</button>
                <h3>Outs:</h3>
                <div id="${compartmentName}Outs">
                </div>
                <button class="w3-btn w3-border w3-round-xlarge styled-btn" id="${compartmentName}AddOut">Add Out</button>
            </td>

            `
            setInterval(() => {
                document.getElementById(`${compartmentName}AddIn`).onclick = async() => {
                    const variables = [];
                    while (true) {
                        const { value } = await Swal.fire({
                            title: 'Add a variable to the "In"',
                            text: `Current Expression: ${variables.join(" * ")}`,
                            input: 'select',
                            inputOptions: {
                                "Parameters": Object.fromEntries(parameters.map(p => [p, p])),
                                "Compartments": Object.fromEntries(compartments.map(c => [c.name, c.desc]))
                            },
                            showCancelButton: true,
                            inputValidator: (value) => {
                                if (!value) {
                                    return 'You need to write something!'
                                }
                            }
                        })
                        if (!value) {
                            break;
                        }
                        variables.push(value);
                    }
                    if (variables.length > 0) {
                        const removeId = Math.random().toString().slice(2);
                        const pId = Math.random().toString().slice(2);
                        document.getElementById(`${compartmentName}Ins`).innerHTML += `<p id="${pId}">${variables.join(" * ")} <button class="w3-btn w3-border w3-round-xlarge styled-btn" id="${removeId}">Remove</button></p>`;
                        setInterval(() => {
                            if (document.getElementById(removeId)) {
                                document.getElementById(removeId).onclick = () => {
                                    const cpt = compartments.find(({ name }) => name === compartmentName);
                                    cpt.ins.splice(cpt.ins.indexOf(variables), 1);
                                    document.getElementById(pId).remove();
                                }
                            }
                        }, 30);
                        compartments.find(({ name }) => name === compartmentName).ins.push(variables);
                    }

                }
                document.getElementById(`${compartmentName}AddOut`).onclick = async() => {
                    const variables = [];
                    while (true) {
                        const { value } = await Swal.fire({
                            title: 'Add a variable to the "Out"',
                            text: `Current Expression: ${variables.join(" * ")}`,
                            input: 'select',
                            inputOptions: {
                                "Parameters": Object.fromEntries(parameters.map(p => [p, p])),
                                "Compartments": Object.fromEntries(compartments.map(c => [c.name, c.desc]))
                            },
                            showCancelButton: true,
                            inputValidator: (value) => {
                                if (!value) {
                                    return 'You need to write something!'
                                }
                            }
                        })
                        if (!value) {
                            break;
                        }
                        variables.push(value);
                    }
                    if (variables.length > 0) {
                        const removeId = Math.random().toString().slice(2);
                        const pId = Math.random().toString().slice(2);
                        document.getElementById(`${compartmentName}Outs`).innerHTML += `<p id="${pId}">${variables.join(" * ")} <button class="w3-btn w3-border w3-round-xlarge styled-btn" id="${removeId}">Remove</button></p>`;
                        setInterval(() => {
                            if (document.getElementById(removeId)) {
                                document.getElementById(removeId).onclick = () => {
                                    const cpt = compartments.find(({ name }) => name === compartmentName);
                                    cpt.outs.splice(cpt.outs.indexOf(variables), 1);
                                    document.getElementById(pId).remove();
                                }
                            }
                        }, 30);
                        compartments.find(({ name }) => name === compartmentName).outs.push(variables);
                    }

                }
            });
        }
    }
}
let simulationRunning = false;
document.getElementById("start").onclick = () => {
    if (simulationRunning) {
        return;
    }
    if (compartments.length === 0) {
        Swal.fire({
            icon: "error",
            title: "You need to create at last one compartment to run a model!",
            text: "Click the create a compartment button to get started."
        });
        return;
    }
    let ps = Object.fromEntries(parameters.map(x => [x, document.getElementById(x).value]));
    if (Object.values(ps).some(x => x === "")) {
        Swal.fire({
            icon: "error",
            title: `Parameters are missing values!`,
            text: "Please give them values to initiate the simulation."
        })
        return;
    }
    let cObj = Object.fromEntries(compartments.map(({ name }) => [name, document.getElementById(`${name}initVal`).value]));
    if (Object.values(cObj).some(x => x === "")) {
        Swal.fire({
            icon: "error",
            title: `Compartments are missing initial values!`,
            text: "Please give them values to initiate the simulation."
        })
        return;
    }
    simulationRunning = true;
    model.destroy();
    ps = Object.fromEntries(Object.entries(ps).map(([x, y]) => [x, +y]));
    cObj = Object.fromEntries(Object.entries(cObj).map(([x, y]) => [x, +y]));
    let timestep = 0;
    model = new Chart(document.getElementById("model"), {
        type: "line",
        data: {
            labels: ["t0"],
            datasets: Object.keys(cObj).map(x => ({
                    data: [+document.getElementById(`${x}initVal`).value],
                    label: compartments.find(({ name }) => name === x).desc,
                    fill: false,
                    borderColor: document.getElementById(`${x}Color`).value
                }))
                /*{
                               data: [susceptible * pop],
                               label: "Susceptible",
                               fill: false,
                               borderColor: "#3e95cd"
                           }, {
                               data: [infected * pop],
                               label: "Infected",
                               fill: false,
                               borderColor: "#c45850"
                           }, {
                               data: [removed * pop],
                               label: "Removed",
                               fill: false,
                               borderColor: "#999999"
                           }*/
        },
        options: {
            title: {
                display: true,
                text: "Model"
            }
        }
    });
    const readVal = (v, obj) => {
        if (parameters.includes(v)) {
            return ps[v];
        }
        return obj[v];
    }
    modelInterval = setInterval(() => {
        timestep++;
        const oldC = {...cObj }
        model.data.labels.push("t" + timestep);
        model.data.datasets.forEach(dataset => {
            const cpt = compartments.find(({ desc }) => desc === dataset.label);
            cpt.ins.forEach(varList => {
                const val = varList.map(x => readVal(x, oldC)).reduce((t, v) => t * v);
                cObj[cpt.name] += val;
            })
            cpt.outs.forEach(varList => {
                const val = varList.map(x => readVal(x, oldC)).reduce((t, v) => t * v);
                cObj[cpt.name] -= val;
            })
            dataset.data.push(cObj[cpt.name]);
        });
        model.update();
    }, 1000 / document.getElementById("speed").value);
}

document.getElementById("end").onclick = () => {
    simulationRunning = false;
    clearInterval(modelInterval);
}