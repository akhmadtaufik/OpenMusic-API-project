const amqp = require("amqplib");
const process = require("process");
const { Buffer } = require("buffer");

class ProducerService {
  async sendMessage(queue, message) {
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });
    await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));

    setTimeout(() => {
      connection.close();
    }, 1000);
  }
}

module.exports = ProducerService;
