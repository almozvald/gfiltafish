var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth.json');
var request = require('request');

const client = new Discord.Client();
client.login(auth.token);
'use strict';

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});

logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

var prefix = '~';
var ids = [];

client.on('ready', () => {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(client.user.username + ' - (' + client.user.id + ')');;
});

var curchannel;

var quotes=['זה ספר - מין דבר מלבני כזה עם דפים',
	'אני מאמין בחומוס',"אם חם לכם יותר מדי צאו מהמטבח",
	"אבא שלי אמר לי: לעולם לא תהיה גמל, נולדת חמור",
	"אין מה לעשות בפ״ת אפילו כשאין קורונה."];

var randomquote = function (channelID) {
	curchannel.send(quotes[Math.floor(Math.random() * quotes.length)]);
}

var allquote = function (channelID) {
	for (var i = 0; i < quotes.length; i++)
		curchannel.send(quotes[i]);
}


var shutup =false;
var intervaled = function(annoychannel, annoymessage, timesleft , interval){
	if (timesleft > 0 && !shutup){
		annoychannel.send(annoymessage);
		timesleft--;
		setTimeout(function(){intervaled(annoychannel,annoymessage,timesleft,interval);}, interval);
	}
}

client.on('message', msg => {//(user, userID, channelID, message, evt) 
	var message = msg.content;
	var user = msg.author;
	var userID = user.id;
	var channel = msg.channel;
	var channelID = msg.channel.id;
	
	if (message.substring(0, prefix.length) == prefix) {// a direct call for nezerbot
		curchannel = channel;
		var args = message.substring(prefix.length).split(' ');
		var cmd = args[0];

		args = args.splice(1);
		switch (cmd) {
			case 'help':
				var message='';

				var documntation=['ברוך הבא לגפילטאפיש גרסא 1.0.1',
					'מצורפת רשימה של כל הפקודות החוקיות:',
					'~help '+' קבל את ההודעה הזאת',
					'~ping '+'בדוק האם הבוט הזה חי',
					'~shutup ' +' אמור להשתיק אותו כן בטח ',
					'~unshutup ' +' יוציא אותו מהשתקה ',
					'~randomquote ' +' הדפס ציטוט אקראי ',
					'~allquote ' +' הדפס את כל הציטוטים ',
					'~repeat '+'כדי לשלוט בכמה פעמים וכמה זמן הוא יחכה בין פעם לפעם' +' wait, times '+' חזור על אותה הודעה כמה פעמים ניתן להשתמש ב ',
					''
				];

				documntation[documntation.length - 1] = shutup ? '~repeat'+'הבוט כרגע מושתק אז שום הודעה לא תקרה עם תשתמש ב' : 'בוט כרגע לא מושתק אז'+' repeat~ '+'עובד לכולם';
			
				for (var i = 0; i < documntation.length; i++)
					message += documntation[i] + '\n';
				
				channel.send(message);
				break;
			case 'ping':
				channel.send('אני חי כמו תמיד');
				break;
			case 'shutup':
				shutup = true;
				channel.send('<@' +userID+'> אוקי אבל גם אתה');
				break;
			case 'unshutup':
				shutup = false;
				channel.send('<@' +userID+'> תודה לך צדיק');
				break;
			case 'repeat':
				logger.info(channel);
				var message = '';
				var timesleft = 10;
				var interval = 2000;
				for (var i = 0; i < args.length; i++) {
					if (args[i] == 'times') {
						timesleft=Number(args[i + 1]);
						i++;
						continue;
						if (timesleft > 200) {
							channel.send('<@' +userID+'> '+'מגבלת כמות חזרות מקסימלית כרגע עומדת על 200');
							timesleft = 200;
							break;
						}
					}
					if (args[i] == 'wait') {
						interval = 1000 * Number(args[i + 1]);
						i++;
						if (interval < 1000) {
							channel.send('<@' +userID+'> '+'מגבלה בין חזרה לחזרה עומדת על שנייה');
							interval = 1000;
							break;
						}
						continue;
					}
					if (args[i] == 'channel') {
						channel= client.channels.cache.get(args[i + 1]);
						i++;
						continue;
					}
					if (args[i] == '~repeat') {
						channel.send('<@' +userID+'> '+'אין לך הרשאות לבצע פעולה זאת וגם לא לאף אחד אחר');
						timesleft = 0;
					break;
					}
					message += args[i]+' ';
				}
				intervaled(channel,message,timesleft,interval);
				break;
			case 'randomquote':
				randomquote(channelID);
				break;
			case 'allquote':
				allquote(channelID);
				break;
			default :
				channel.send(':לא ממש הבנתי מה אתה מנסה להגיד הפקודות החוקיות הן' + '\n~help');
		}
	} else {
		if (user.bot) {
			logger.info('meesage by bot');
			return;
			logger.info('what?');
		}
		
		if (message.indexOf(client.user.id) != -1 || message.indexOf(client.user.username) != -1) {
			logger.info('bot.id: '+message.indexOf(client.user.id));
			logger.info('bot.username: '+message.indexOf(client.user.username));
			//logger.info('end: '+message.indexOf('safasfhfhfbw'));
			var possibleresponses=['מי זה מדבר עלי?', 'מה אתה רוצה ממני?','הי מה אתה חושב שאתה אומר עלי?'];
			channel.send(possibleresponses[Math.floor(Math.random() * possibleresponses.length)] + '\n נסה ~help לעזרה בשביל להבין עלי יותר');
			return;
		}
		
		if (message.indexOf("כרמי")!=-1) {
			const emoji = msg.guild.emojis.cache.get('423207044578017281');
			if (emoji)
				msg.react(emoji);
			var possibleresponses=['1+e^i(pi)', '0','אפס'];
			channel.send(possibleresponses[Math.floor(Math.random() * possibleresponses.length)]);
		}
		if (message.indexOf("בניו")!=-1){
			const emoji = msg.guild.emojis.cache.get('393866050585886721');
			if (emoji)
				msg.react(emoji);
		}
		if (message.indexOf("אבן")!=-1){
			const emoji = msg.guild.emojis.cache.get('423208712560443412');
			if (emoji)
				msg.react(emoji);
		}
		if (message.indexOf("שמש")!=-1){
			const emoji = msg.guild.emojis.cache.get('725825841757552730');
			if (emoji)
				msg.react(emoji);
		}
		
		if(Math.random()<0.003){
			var possibleresponses=['שתוק'];
			channel.send('<@' +userID+'> '+possibleresponses[Math.floor(Math.random()*possibleresponses.length)]);
			logger.info('answering random message');
		}

	}
});
