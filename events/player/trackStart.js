const { MessageEmbed, MessageActionRow, MessageButton, Interaction } = require("discord.js");
const formatduration = require('../../structures/formatduration');
const GControl = require('../../plugins/guildConfig.js');
   
module.exports = async (client, player, track, payload) => {
  const GuildControl = await GControl.findOne({ guild: player.guild });
  if (GuildControl.playerControl === 'enable'){
    const embeded = new MessageEmbed()
      .setAuthor({ name: `Starting playing...`, iconURL: 'https://cdn.discordapp.com/emojis/741605543046807626.gif'})
      .setDescription(`**[${track.title}](${track.uri})**`)
      .setColor(client.color)
      .setThumbnail(`https://img.youtube.com/vi/${track.identifier}/hqdefault.jpg`)
      .addField('Author:', `${track.author}`, true)
      .addField('Requester:', `${track.requester}`, true)
      .addField('Current Volume:', `${player.volume}%`, true)
      .addField('Queue Length:', `${player.queue.length}`, true)
      .addField('Duration:', `${formatduration(track.duration, true)}`, true)
      .addField('Total Duration:', `${formatduration(player.queue.duration)}`, true)
      .addField(`Current Duration: \`[0:00 / ${formatduration(track.duration, true)}]\``, `\`\`\`π΄ | πΆββββββββββββββββββββββββββββββ\`\`\``)
      .setTimestamp();
    
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId("pause")
          .setEmoji("β―")
          .setStyle("SUCCESS")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("replay")
          .setEmoji("β¬")
          .setStyle("PRIMARY")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("stop")
          .setEmoji("β")
          .setStyle("DANGER")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("skip")
          .setEmoji("β‘")
          .setStyle("PRIMARY")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("loop")
          .setEmoji("π")
          .setStyle("SUCCESS")
      )
    
    const row2 = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId("shuffle")
          .setEmoji("π")
          .setStyle("SUCCESS")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("voldown")
          .setEmoji("π")
          .setStyle("PRIMARY")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("clear")
          .setEmoji("π")
          .setStyle("DANGER")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("volup")
          .setEmoji("π")
          .setStyle("PRIMARY")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("queue")
          .setEmoji("π")
          .setStyle("SUCCESS")
      )
   
    const nplaying = await client.channels.cache.get(player.textChannel).send({ embeds: [embeded], components: [row, row2] });

    const filter = (message) => {
      if(message.guild.me.voice.channel && message.guild.me.voice.channelId === message.member.voice.channelId) return true;
      else {
        message.reply({ content: "You need to be in a same/voice channel.", ephemeral: true });
      }
    };
    const collector = nplaying.createMessageComponentCollector({ filter, time: track.duration });

    collector.on('collect', async (message) => {
      const id = message.customId;
      if(id === "pause") {
      if(!player) {
          collector.stop();
      }
        await player.pause(!player.paused);
        const uni = player.paused ? "Paused" : "Resumed";

        const embed = new MessageEmbed()
            .setDescription(`\`β―\` **Song has been:** \`${uni}\``)
            .setColor(client.color);

        message.reply({ embeds: [embed], ephemeral: true });
      } else if (id === "skip") {
        if(!player) {
          collector.stop();
        }
        await player.stop();

        const embed = new MessageEmbed()
            .setDescription("\`β­\` | **Song has been:** `Skipped`")
            .setColor(client.color);

        await nplaying.edit({ embeds: [embeded], components: [] });
        message.reply({ embeds: [embed], ephemeral: true });
      } else if(id === "stop") {
        if(!player) {
          collector.stop();
        }

        await player.stop();
        await player.destroy();

        const embed = new MessageEmbed()
            .setDescription(`\`π«\` | **Song has been:** | \`Stopped\``)
            .setColor(client.color);
        
        await nplaying.edit({ embeds: [embeded], components: [] });
        message.reply({ embeds: [embed], ephemeral: true });
      } else if(id === "shuffle") {
        if(!player) {
          collector.stop();
        }
        await player.queue.shuffle();

        const embed = new MessageEmbed()
            .setDescription(`\`π\` **Queue has been:** \`Shuffle\``)
            .setColor(client.color);

        message.reply({ embeds: [embed], ephemeral: true });
      } else if(id === "loop") {
        if(!player) {
          collector.stop();
        }
        await player.setTrackRepeat(!player.trackRepeat);
        const uni = player.trackRepeat ? "Enabled" : "Disabled";

        const embed = new MessageEmbed()
            .setDescription(`\`π\` **Loop has been:** \`${uni}\``)
            .setColor(client.color);

        message.reply({ embeds: [embed], ephemeral: true });
      } else if(id === "volup") {
        if(!player) {
          collector.stop();
        }
        await player.setVolume(player.volume + 5);

        const embed = new MessageEmbed()
            .setDescription(`\`π\` **Change volume to:** \`${player.volume}%\``)
            .setColor(client.color);

        message.reply({ embeds: [embed], ephemeral: true });
      }
      else if(id === "voldown") {
        if(!player) {
          collector.stop();
        }
        await player.setVolume(player.volume - 5);

        const embed = new MessageEmbed()
            .setDescription(`\`π\` **Change volume to:** \`${player.volume}%\``)
            .setColor(client.color);

        message.reply({ embeds: [embed], ephemeral: true });
      }
      else if(id === "replay") {
        if(!player) {
          collector.stop();
        }
        await player.seek(0);

        const embed = new MessageEmbed()
            .setDescription("\`β?\` | **Song has been:** `Replay`")
            .setColor(client.color);

        message.reply({ embeds: [embed], ephemeral: true });
      }
      else if(id === "queue") {
        if(!player) {
          collector.stop();
        }
        const song = player.queue.current;
        const qduration = `${formatduration(player.queue.duration)}`;
        const thumbnail = `https://img.youtube.com/vi/${song.identifier}/hqdefault.jpg`;
    
        let pagesNum = Math.ceil(player.queue.length / 10);
        if(pagesNum === 0) pagesNum = 1;
    
        const songStrings = [];
        for (let i = 0; i < player.queue.length; i++) {
          const song = player.queue[i];
          songStrings.push(
            `**${i + 1}.** [${song.title}](${song.uri}) \`[${formatduration(song.duration)}]\` β’ ${song.requester}
            `);
        }

        const pages = [];
        for (let i = 0; i < pagesNum; i++) {
          const str = songStrings.slice(i * 10, i * 10 + 10).join('');
    
          const embed = new MessageEmbed()
            .setAuthor({ name: `Queue - ${message.guild.name}`, iconURL: message.guild.iconURL({ dynamic: true }) })
            .setThumbnail(thumbnail)
            .setColor(client.color)
            .setDescription(`**Currently Playing**\n**[${song.title}](${song.uri})** \`[${formatduration(song.duration)}]\` β’ ${song.requester}\n\n**Rest of queue**:${str == '' ? '  Nothing' : '\n' + str}`)
            .setFooter({ text: `Page β’ ${i + 1}/${pagesNum} | ${player.queue.length} β’ Song | ${qduration} β’ Total duration`});
    
          pages.push(embed);
        }
        message.reply({ embeds: [pages[0]], ephemeral: true });
      }
      else if(id === "clear") {
        if(!player) {
          collector.stop();
        }
        await player.queue.clear();

        const embed = new MessageEmbed()
            .setDescription("\`π\` | **Queue has been:** `Cleared`")
            .setColor(client.color);

        message.reply({ embeds: [embed], ephemeral: true });
      }
    });
    collector.on('end', async (collected, reason) => {
      if(reason === "time") {
        nplaying.edit({ embeds: [embeded], components: [] })
      }
    });
  } else if(GuildControl.playerControl === 'disable'){
    null
  }
}