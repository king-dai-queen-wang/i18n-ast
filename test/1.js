var a = [
    {
        run: async() => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {console.log(1);resolve()}, 5000)
            })
        }
    }, {
        run: async () => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {console.log(3); resolve()}, 1000)
            })
        }
    }];

// a.forEach(async (item) => {await item.run()})

(async function() {
        
    for (let index = 0; index < a.length; index++) {
        const element = await a[index].run();
    }
})();

// ((x)=>{console.log(x)})(1)