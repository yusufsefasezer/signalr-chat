using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace signalr_chat.Hubs
{
    public class ChatHub : Hub
    {
        public static Dictionary<string, string> Users { get; set; } = new Dictionary<string, string>();

        public async Task SetUsername(string username)
        {
            bool isTaken = Users.Where(p => p.Value == username).Count() >= 1;
            if (isTaken) { Context.Abort(); return; }
            Users[Context.ConnectionId] = username;
            await Clients.All.SendAsync("OnJoin", DateTime.Now, username, Users.Count);
        }

        public async Task SendMessage(string message)
        {
            string username = Users[Context.ConnectionId];
            await Clients.All.SendAsync("NewMessage", DateTime.Now, username, message);
        }

        public override Task OnConnectedAsync()
        {
            return base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            string username = Users[Context.ConnectionId];
            bool isTaken = Users.Where(p => p.Value == username).Count() > 1;
            if (isTaken) { return; }
            Users.Remove(Context.ConnectionId);
            await Clients.All.SendAsync("OnLeft", DateTime.Now, username, Users.Count);
        }

    }
}