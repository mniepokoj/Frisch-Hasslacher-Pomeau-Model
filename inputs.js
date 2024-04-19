document.addEventListener("DOMContentLoaded", function() {
    var modeSelect = document.getElementById("modeSelect");
    var mode1 = document.getElementById("mode1");
    var mode2 = document.getElementById("mode2");

    modeSelect.addEventListener("change", function() 
    {
        var selectedMode = this.value;

        if (selectedMode === "mode1") 
        {
            mode1.style.display = "block";
            mode2.style.display = "none";

            var inputs = document.querySelectorAll('.customInput');

            number = 0;
            for(var i = 0; i < 32; i++)
            {
                number += inputs[i].value * Math.pow(2, i);
            }

            document.getElementById("automatonNumber").value = number;
        } 
        else 
        {
            mode1.style.display = "none";
            mode2.style.display = "block";
            inputVal = document.getElementById("automatonNumber").value;
            generateInputs(inputVal);
        }    
    });

    function generateInputs(value) 
    {
        inputVal = document.getElementById("automatonNumber").value;

        var inputRows = document.getElementById("inputRows");
        inputRows.innerHTML = "";

        for (var i = 0; i < 4; i++) {
            var row = document.createElement("div");
            row.classList.add("inputRow");

            for (var j = 0; j < 8; j++) 
            {
                var inputValue = ((i * 8) + j).toString(2).padStart(5, '0');

                var inputDescription = document.createElement("span");
                inputDescription.textContent = inputValue + ": ";
                
                inputDescription.style.display = "inline-block";
                inputDescription.style.width = "50px";
                inputDescription.classList.add("customInputDescription");

                var input = document.createElement("input");
                input.type = "number";
                input.value = (value >> i*8+j) & 1;
                input.min = 0;
                input.max = 1;
                input.pattern = "[0-1]";
                input.size = 2;

                input.classList.add("customInput");

                row.appendChild(inputDescription);
                row.appendChild(input);
            }
            inputRows.appendChild(row);
        }
    }
});

//FHP (hydrostatyka)
//GameOfLife
//Tree
//Model sznajd
//ruch uliczny