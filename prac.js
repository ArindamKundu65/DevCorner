const arr = [2,5,7,3,44,56,3];

function fn() {
    arr.sort((a, b)=> a - b)
    return arr;
}

console.log(fn());