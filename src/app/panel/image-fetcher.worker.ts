/// <reference lib="webworker" />

onmessage = ({ data }) => {
    console.log('received message:', data);
};

console.log('image fetching worker is running ...');
