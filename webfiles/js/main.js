API_ENDPOINT = 'https://discordapp.com/api/v6';
CLIENT_ID = '366454911879086081';
CLIENT_SECRET = 'x2ZN68osenPjysy9d-ly_osBp4NUfrUn';
REDIRECT_URI = 'https://www.jemverse.xyz/botAuth';

def exchange_code(code):
data = {
  'client_id': CLIENT_ID,
  'client_secret': CLIENT_SECRET,
  'grant_type': 'authorization_code',
  'code': code,
  'redirect_uri': REDIRECT_URI,
  'scope': 'identify email connections'
};
headers = {
  'Content-Type': 'application/x-www-form-urlencoded'
};
r = requests.post('%s/oauth2/token' % API_ENDPOINT, data=data, headers=headers);
r.raise_for_status();
console.info(r.json());
