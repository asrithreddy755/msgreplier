fetch('https://stuxvrgtalbfnvudnozu.supabase.co/rest/v1/love_rooms?select=*&limit=1', {
  headers: {
    apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0dXh2cmd0YWxiZm52dWRub3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NDc1NjMsImV4cCI6MjA4NzQyMzU2M30.EnfD2-nqzVvfif_HQ2XIP6jSoEfzyUxZSp1rhiqyDhg',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0dXh2cmd0YWxiZm52dWRub3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NDc1NjMsImV4cCI6MjA4NzQyMzU2M30.EnfD2-nqzVvfif_HQ2XIP6jSoEfzyUxZSp1rhiqyDhg'
  }
}).then(res => res.json()).then(console.log);
