const amqp = require('amqplib');
const process = require('process');
// const MailSender = require('./MailSender');
// const PlaylistsService = require('../PlaylistsService');

class ConsumerService {
  constructor(playlistsService, mailSender) {
    this._playlistsService = playlistsService;
    this._mailSender = mailSender;
  }

  async consume(queue) {
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });

    channel.consume(queue, async (message) => {
      if (message !== null) {
        const { playlistId, targetEmail } = JSON.parse(
          message.content.toString()
        );

        // Get playlist and songs data
        const playlist = await this._playlistsService.getSongsFromPlaylist(
          playlistId
        );

        const data = {
          playlist: {
            id: playlist.id,
            name: playlist.name,
            songs: playlist.songs,
          },
        };

        // Send email
        await this._mailSender.sendEmail(
          targetEmail,
          JSON.stringify(data, null, 2)
        );

        channel.ack(message);
      }
    });
  }
}

module.exports = ConsumerService;
