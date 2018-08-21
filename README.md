# Gladys Teleinfo EDF

Gladys hooks to store EDF data through teleinfo 

Need Gladys version >= 3.0.0.

# MIGHT WORK WITH LINKY depending on device you use

## Documentation

To install this module : 

- Create parameter TELEINFO_TTY = path to /dev/<your tty device>
- Facultative: Create parameter TELEINFO_DELAY = Duration in millisecond to wait before storing each data (default: 15000)

- Install the module in Gladys.
- Launch command: grunt buildProd
- Reboot Gladys.
