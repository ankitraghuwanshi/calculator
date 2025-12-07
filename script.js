const displayBox=document.querySelector(".display"),
    displayInput=document.querySelector(".display-input"),
    displayResult=document.querySelector(".display-result"),
    buttons=document.querySelectorAll("button");
const operators=["%","/","*","-","+"];
let input = "",
    result = "",
    lastCalculation = false;

//main function to handle calculator logic
const calculate=(btnValue)=>{
    //
    const lastChar=input.slice(-1),
        secondToLastChar=input.slice(-2, -1),
        withoutLastChar=input.slice(0, -1),
        isLastCharOperator=operators.includes(lastChar),
        isInvalidresult=["Error","Infinity"].includes(result);
    let { openBracketCount, closeBracketCount } = countBracket(input);
    //handle equal
    if(btnValue === "="){
        //handle error
        if(
            input === "" ||
            lastChar === "." ||
            lastChar === "(" ||
            isLastCharOperator && lastChar !== "%" ||
            lastCalculation
        ){return;}

        //bracket error handle
        while(openBracketCount > closeBracketCount){
            input = input + ")" ;
            closeBracketCount++ ;
        }

        //const formattedInput=replaceOperators(input);
        try {
            //const calculatedValue=Math.evaluate(input)
            const calculatedValue=input.includes("%") ? calculatePercentage(input) : eval(input);
            result=parseFloat(calculatedValue.toFixed(10)).toString();
        } catch (error) {
            result="Error";
        }
        input=input+btnValue;
        lastCalculation = true;
        displayBox.classList.add("active");
    }
    //handle AC 
    else if(btnValue==="AC"){
        resetCalculator("");
    }
    //handle backspace
    else if(btnValue===""){
        if (lastCalculation) {
            if(isInvalidresult){resetCalculator("");}
            resetCalculator(result.slice(0, -1));
        } else {
            input=withoutLastChar;   
        }
    }
    //handle operator
    else if(operators.includes(btnValue)){
        if(lastCalculation){
            if(isInvalidresult){return;}
            resetCalculator(result + btnValue);
        }
        else if(
            (input === "" || lastChar === "(") && btnValue !== "-" || 
            input === "-" ||
            lastChar === "." ||
            secondToLastChar === "(" && lastChar === "-" ||
            (secondToLastChar === "%" || lastChar === "%") && btnValue === "%"
        ){return;}
        else if(lastChar === "%"){input=input+btnValue;}
        else if(isLastCharOperator){
            input=withoutLastChar + btnValue;
        }
        else{
            input=input+btnValue;
        }
    }
    //handle decimal
    else if(btnValue === "."){
        const decimalValue = "0.";
        if(lastCalculation){resetCalculator(decimalValue);}
        else if(lastChar === ")" || lastChar === "%"){
            input=input + "*" + decimalValue;
        }
        else if(input === "" || isLastCharOperator || lastChar === "("){
            input=input + decimalValue;
        }
        else{
            let lastOperatorIndex = -1;
            for(const operator of operators){
                const index = input.lastIndexOf(operator);
                if(index > lastOperatorIndex){lastOperatorIndex = index;}
            }
            if(!input.slice(lastOperatorIndex + 1).includes(".")){
                input=input+btnValue;
            }
        }
    }
    //handle brackets
    else if(btnValue === "( )"){
        if(lastCalculation){
            if(isInvalidresult){resetCalculator("(");}
            else{resetCalculator(result + "*(");}
        }
        else if(input === "" || isLastCharOperator && lastChar !== "%"){
            resetCalculator(input = input + "(");
        }
        else if(lastChar === "(" || lastChar === "."){return;}
        else if(openBracketCount > closeBracketCount){input = input + ")";}
        else{
            resetCalculator(input =input + "*(")
        }
    }
    //handle number
    else{
        if (lastCalculation) {
            resetCalculator(btnValue);
        } 
        else if (input === "0"){input = btnValue ;}
        else if((operators.includes(secondToLastChar) || secondToLastChar === "(")&& lastChar === "0"){input =  withoutLastChar + btnValue ;}
        else if(lastChar===")" || lastChar==="%"){input=input+"*"+btnValue;}
        else {
            input=input+btnValue;   
        }
    }

    //update display
    displayInput.value=input;
    displayResult.value=result;
    //scroll display
    displayInput.scrollLeft=displayInput.scrollWidth;
};

//function to reset the value
const resetCalculator=(newInput)=>{
    input=newInput;
    result="";
    lastCalculation = false;
    displayBox.classList.remove("active");
}

//function to countt brackets in input
const countBracket=(input)=>{
    let openBracketCount=0,
        closeBracketCount=0;
    for(const char of input){
        if(char === "("){openBracketCount++;}
        else if(char === ")"){closeBracketCount++;}
    }
    return { openBracketCount, closeBracketCount };
}

//function to handle percentage calculation
const calculatePercentage=(input)=>{
    let processedInput = "",
        numberBuffer = "";
    const bracketsState=[];
    for(let i=0; i<input.length; i++){
        const char=input[i];
        if(!isNaN(char) || char === "."){numberBuffer=numberBuffer + char}
        else if(char === "%"){
            const percentValue=parseFloat(numberBuffer)/100,
                prevOperator= i>0 ? input[i - numberBuffer.length -1] : "",
                nextOperator= i+1<input.length&&operators.includes(input[i+1]) ? input[i+1] : "";
        
            if(!prevOperator || prevOperator==="/" || prevOperator==="*" || prevOperator==="("){
                processedInput += percentValue;
            }
            else if(prevOperator==="-" || prevOperator==="+"){
                if(nextOperator==="/" || nextOperator==="*"){
                    processedInput += percentValue;
                }
                else{
                    processedInput += "(" + processedInput.slice(0,-1) + ")" + percentValue;
                }
            }
            numberBuffer = "";
        }
        else if(operators.includes(char) || char==="(" || char===")"){
            if(numberBuffer){
                processedInput += numberBuffer;
                numberBuffer="";
            }
            if(operators.includes(char)){processedInput += char}
            else if(char==="("){
                processedInput += "(";
                bracketsState.push(processedInput);
                processedInput = "";
            }
            else{
                processedInput += ")";
                processedInput = bracketsState.pop() + processedInput;
            }
        }
    }
    if(numberBuffer){processedInput += numberBuffer}

    return eval(processedInput);
};

//add click EventListener to all buttons
buttons.forEach((button)=>{
    button.addEventListener('click',(e)=>{
        calculate(e.target.textContent);
    })
})