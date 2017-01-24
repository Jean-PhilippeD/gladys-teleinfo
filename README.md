# Gladys Teleinfo EDF

Gladys hooks to store EDF data through teleinfo 

Need Gladys version >= 3.0.0.

## Documentation

To install this module : 

- Create parameter TELEINFO_TTY = path to /dev/<your tty device>
- Facultative: Create parameter TELEINFO_DELAY = Duration in millisecond to wait before storing each data (default: 15000)
- Facultative: Creat parameter TELEINFO_HISTORIC = Time to save data, in days (default: 365)

- Install the module in Gladys.
- Reboot Gladys.
