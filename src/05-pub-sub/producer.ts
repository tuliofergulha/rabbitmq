import amqp from "amqplib";

async function producer() {
    const connection = await amqp.connect("amqp://admin:admin@localhost:5672");
    const channel = await connection.createChannel();
 
    const exchange = "amq.fanout";
    const queueHello = "hello";
    const queueProducts = "products";
    
    await channel.assertQueue(queueHello);
    await channel.assertQueue(queueProducts);

    // It was bound queueHello and queueProducts on amq.fanout exchange

    const messages = new Array(10000).fill(0).map((_, i) => ({
        id: i,
        name: `Product ${i}`,
        price: Math.floor(Math.random() * 100),
    }));

    await Promise.all(
        messages.map((message) => {
            return channel.publish(
                exchange, 
                '', 
                Buffer.from(JSON.stringify(message)), {
                    contentType: "application/json",
            });
        })
    );
    console.log(`Messages sent to exchange ${exchange}`);

    setTimeout(() => {
        connection.close();
        process.exit(0);
    }, 500);
}

producer().catch(console.error);

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}