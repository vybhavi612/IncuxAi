function countNumbers(arr) {

    let positive = 0;
    let negative = 0;

    for(let i = 0; i < arr.length; i++) {

        if(arr[i] >= 0)
            positive++;
        else
            negative++;
    }

    console.log("Positive:", positive);
    console.log("Negative:", negative);
}

countNumbers([5, -2, 8, -7, 0, 12, -3]);