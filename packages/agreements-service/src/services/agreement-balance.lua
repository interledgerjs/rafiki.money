-- valueKey timestampKey | max_amount interval_start amount
local valueKey     = KEYS[1] -- "agreements:id:balance"
local timestampKey = KEYS[2] -- "agreements:id:timestamp"
local interval_start  = tonumber(ARGV[1]) -- as milliseconds
-- Use effects replication, not script replication;; this allows us to call 'TIME' which is non-deterministic
--redis.replicate_commands()

local initialBalance = redis.call('GET', valueKey)
local initialIntervalStart = redis.call('GET', timestampKey)

local currentBalance

---- If we found no record, there was no prevBalance or entered new interval reset balance to zero
if initialBalance == false then
  currentBalance = 0
else
  if initialIntervalStart == false then
      print('Error as it should be set')
      return 0
  end
  --- In a new interval window => need to reset the balance to zero
  if tonumber(initialIntervalStart) < interval_start then
      currentBalance = 0
  --- In current interval window => use balance and interval from redis
  else
      currentBalance = tonumber(initialBalance)
  end
end

return currentBalance
