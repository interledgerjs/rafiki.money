-- valueKey timestampKey | max_amount interval_start amount
local valueKey     = KEYS[1] -- "agreements:id:balance"
local timestampKey = KEYS[2] -- "agreements:id:timestamp"
local max_amount      = tonumber(ARGV[1]) -- as integer
local interval_start  = tonumber(ARGV[2]) -- as milliseconds
local amount     = tonumber(ARGV[3]) -- as integer
-- Use effects replication, not script replication;; this allows us to call 'TIME' which is non-deterministic
--redis.replicate_commands()

local initialBalance = redis.call('GET', valueKey)
local initialIntervalStart = redis.call('GET', timestampKey)

local currentBalance
local currentIntervalStart

---- If we found no record, there was no prevBalance or entered new interval reset balance to zero
if initialBalance == false then
    currentBalance = 0
    currentIntervalStart = interval_start
else
    if initialIntervalStart == false then
        print('Error as it should be set')
        return 0
    end
    --- In a new interval window => need to reset the balance to zero
    if tonumber(initialIntervalStart) < interval_start then
        currentBalance = 0
        currentIntervalStart = interval_start
    --- In current interval window => use balance and interval from redis
    else
        currentBalance = tonumber(initialBalance)
        currentIntervalStart = tonumber(initialIntervalStart)
    end
end

local potentialBalance = currentBalance + amount

---- FAIL as we exceed the maximum balance for this interval
if (max_amount and potentialBalance > max_amount) then
    return 0
else -- SUCCESS, update the values
    redis.call('SET', valueKey, tostring(potentialBalance))
    redis.call('SET', timestampKey, tostring(currentIntervalStart))
    return 1
end
